import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { PostDoc } from "@/types";

export async function createPost(
  uid: string,
  data: { title: string; content: string },
): Promise<string> {
  const ref = collection(getFirebaseDb(), "posts");
  const docRef = await addDoc(ref, {
    uid,
    title: data.title,
    content: data.content,
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef.id;
}

export async function getUserPosts(uid: string): Promise<PostDoc[]> {
  const ref = collection(getFirebaseDb(), "posts");
  const q = query(ref, where("uid", "==", uid));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(
    (d) =>
      ({
        id: d.id,
        ...d.data(),
      }) as PostDoc,
  );
}

export async function deletePost(postId: string): Promise<void> {
  const ref = doc(getFirebaseDb(), "posts", postId);
  await deleteDoc(ref);
}
