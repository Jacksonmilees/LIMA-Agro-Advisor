
export const resizeImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
              const elem = document.createElement('canvas');
              const scaleFactor = maxWidth / img.width;
              const width = Math.min(img.width, maxWidth);
              const height = img.height * (width < img.width ? scaleFactor : 1);
              
              elem.width = width;
              elem.height = height;
              
              const ctx = elem.getContext('2d');
              if (!ctx) {
                  reject(new Error("Could not get canvas context"));
                  return;
              }
              
              ctx.drawImage(img, 0, 0, width, height);
              resolve(elem.toDataURL('image/jpeg', quality));
          };
          img.onerror = (e) => reject(e);
      };
      reader.onerror = (e) => reject(e);
  });
};

export const safeJSONParse = <T>(key: string, fallback: T): T => {
  try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
  } catch (error) {
      console.error(`Error parsing ${key} from localStorage`, error);
      return fallback;
  }
};
