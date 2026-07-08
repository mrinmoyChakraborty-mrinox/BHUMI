import logging

import requests

from app.config import get_settings

logger = logging.getLogger(__name__)


def upload_image(image_bytes: bytes, mime_type: str, folder: str = "health_logs") -> str | None:
    settings = get_settings()
    if not settings.imagekit_private_key or not settings.imagekit_url_endpoint:
        logger.warning("ImageKit not configured — skipping upload")
        return None

    import uuid
    ext = "jpg" if mime_type == "image/jpeg" else mime_type.split("/")[-1]
    file_name = f"{uuid.uuid4()}.{ext}"

    try:
        resp = requests.post(
            "https://upload.imagekit.io/api/v1/files/upload",
            auth=(settings.imagekit_private_key, ""),
            files={"file": (file_name, image_bytes, mime_type)},
            data={
                "fileName": file_name,
                "folder": folder,
                "useUniqueFileName": "false",
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        url: str | None = data.get("url")
        logger.info("ImageKit upload OK — url=%s", url)
        return url
    except Exception as e:
        logger.error("ImageKit upload failed: %s", e)
        return None
