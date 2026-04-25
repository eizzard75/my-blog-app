import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirebaseApp } from "./client";

function getFirebaseStorage() {
  return getStorage(getFirebaseApp());
}

function uploadFile(path: string, file: File, onProgress?: (percent: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(getFirebaseStorage(), path);
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type });
    task.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress?.(percent);
      },
      reject,
      () => getDownloadURL(task.snapshot.ref).then(resolve).catch(reject),
    );
  });
}

export function uploadProfileImage(uid: string, file: File, onProgress?: (percent: number) => void): Promise<string> {
  const ext = file.name.split(".").pop();
  return uploadFile(`users/${uid}/images/profile.${ext}`, file, onProgress);
}

export function uploadCoverImage(uid: string, postId: string, file: File, onProgress?: (percent: number) => void): Promise<string> {
  const ext = file.name.split(".").pop();
  return uploadFile(`users/${uid}/covers/${postId}.${ext}`, file, onProgress);
}
