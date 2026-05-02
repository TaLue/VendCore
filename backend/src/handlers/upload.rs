use axum::{extract::Multipart, Json};
use serde::Serialize;
use uuid::Uuid;

use crate::errors::{AppError, AppResult};

#[derive(Serialize)]
pub struct UploadResponse {
    pub url: String,
}

pub async fn upload_image(mut multipart: Multipart) -> AppResult<Json<UploadResponse>> {
    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|e| AppError::BadRequest(e.to_string()))?
    {
        if field.name() != Some("file") {
            continue;
        }

        let file_name = field.file_name().unwrap_or("upload").to_string();
        let ext = file_name
            .rsplit('.')
            .next()
            .unwrap_or("jpg")
            .to_lowercase();

        if !["jpg", "jpeg", "png"].contains(&ext.as_str()) {
            return Err(AppError::BadRequest("Only jpg, jpeg, png are allowed".into()));
        }

        let data = field
            .bytes()
            .await
            .map_err(|e| AppError::BadRequest(e.to_string()))?;

        let unique_name = format!("{}.{}", Uuid::new_v4(), ext);
        let path = format!("/app/uploads/{}", unique_name);

        tokio::fs::write(&path, &data)
            .await
            .map_err(|e| AppError::BadRequest(format!("Failed to save file: {}", e)))?;

        return Ok(Json(UploadResponse {
            url: format!("/uploads/{}", unique_name),
        }));
    }

    Err(AppError::BadRequest("No file field in request".into()))
}
