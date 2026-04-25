import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { PostDoc } from "@/types";

export async function createPost(
  uid: string,
  data: { title: string; content: string; coverImage?: string | null; status?: "draft" | "published" },
): Promise<string> {
  const ref = collection(getFirebaseDb(), "posts");
  const docRef = await addDoc(ref, {
    uid,
    title: data.title,
    content: data.content,
    coverImage: data.coverImage ?? null,
    status: data.status ?? "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef.id;
}

export async function getUserPosts(uid: string): Promise<PostDoc[]> {
  const ref = collection(getFirebaseDb(), "posts");
  const q = query(ref, where("uid", "==", uid), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(
    (d) =>
      ({
        id: d.id,
        ...d.data(),
      }) as PostDoc,
  );
}

export async function getPost(postId: string): Promise<PostDoc | null> {
  const ref = doc(getFirebaseDb(), "posts", postId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) return null;

  return { id: snapshot.id, ...snapshot.data() } as PostDoc;
}

export async function updatePost(
  postId: string,
  data: Partial<Pick<PostDoc, "title" | "content" | "status" | "coverImage">>,
): Promise<void> {
  const ref = doc(getFirebaseDb(), "posts", postId);
  await updateDoc(ref, { ...data, updatedAt: new Date() });
}

export async function deletePost(postId: string): Promise<void> {
  const ref = doc(getFirebaseDb(), "posts", postId);
  await deleteDoc(ref);
}
