import firebaseApp from "@/lib/firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";


const storage = getStorage(firebaseApp, "gs://myproject-d1128.firebasestorage.app");

// Shared by every upload helper below — same client-side
// uploadBytesResumable + getDownloadURL flow, just a different destination
// folder per use case (product images vs profile photos).
function uploadFileToFolder(
  file: File,
  folder: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  const storageRef = ref(storage, `${folder}/${fileName}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise<string>((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        if (onProgress) {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(Math.round(progress));
        }
      },
      (error) => reject(error),
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((url) => resolve(url))
          .catch(reject);
      }
    );
  });
}

export default async function handleImageSaveToFireBase(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  return uploadFileToFolder(file, "products", onProgress);
}

// Profile photo upload — same mechanism as product images, uploads to the
// "profile" folder instead. Used by app/profile/page.tsx's avatar picker.
// The mobile app's equivalent (no browser File object to work with) uploads
// to this same "profile" folder server-side instead, via firebase-admin's
// uploadBase64Image() in src/lib/firebase-admin.ts.
export async function handleProfileImageSaveToFirebase(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  return uploadFileToFolder(file, "profile", onProgress);
}