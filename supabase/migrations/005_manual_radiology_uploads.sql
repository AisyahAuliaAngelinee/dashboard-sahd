-- Keep the existing private bucket and ownership policies; accept manual uploads.
update storage.buckets set file_size_limit=4194304,allowed_mime_types=array['image/png','image/jpeg','image/webp'] where id='radiology';
