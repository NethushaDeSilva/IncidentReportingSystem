export function optimizeCloudinaryImage(url, width = 960) {
  if (!url || !url.includes("/image/upload/")) return url;
  if (url.includes("/image/upload/f_auto,")) return url;
  return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
