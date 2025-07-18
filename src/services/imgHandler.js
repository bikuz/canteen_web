export function imageUpload(event, {onSuccess, onError}) {
  const file = event.target.files[0];
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg','image/webp'];
  const maxSize = 5 * 1024 * 1024; // 1MB

  // Validate if a file is selected
  if (!file) {
    if (typeof onError === 'function') onError('No file selected.');
    return;
  }

  // Validate file type
  if (!allowedTypes.includes(file.type)) {
    if (typeof onError === 'function') onError('Only JPG and PNG files are allowed.');
    return;
  }

  // Validate file size
  if (file.size > maxSize) {
    if (typeof onError === 'function') onError('File is too large. Please select a file smaller than 1MB.');
    return;
  }

  // If validation passes, call the onSuccess callback
  if (typeof onSuccess=== 'function') {
    onSuccess({
      imageURL: URL.createObjectURL(file),
      imageFile: file
    });
  }
}
