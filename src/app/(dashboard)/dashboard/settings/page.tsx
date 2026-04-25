"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Camera } from "lucide-react";
import { updateProfile } from "firebase/auth";
import { useAuth } from "@/hooks/use-auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { updateUserDoc } from "@/lib/firestore/users";
import { uploadProfileImage } from "@/lib/firebase/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
    if (user?.photoURL) setAvatarUrl(user.photoURL);
  }, [user]);

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    setMessage(null);
    try {
      const url = await uploadProfileImage(user.uid, file, (pct) => {
        setUploadProgress(pct);
      });
      const firebaseUser = getFirebaseAuth().currentUser;
      if (firebaseUser) await updateProfile(firebaseUser, { photoURL: url });
      await updateUserDoc(user.uid, { photoURL: url });
      setAvatarUrl(url);
      setUploadProgress(null);
      await refreshUser();
      setMessage("Profile image updated.");
    } catch {
      setUploadProgress(null);
      setMessage("Failed to upload image.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);
    try {
      const firebaseUser = getFirebaseAuth().currentUser;
      if (firebaseUser) await updateProfile(firebaseUser, { displayName });
      await updateUserDoc(user.uid, { displayName });
      await refreshUser();
      setMessage("Settings saved.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessage(`Failed: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account details.</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your photo and display name.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="space-y-5">

            {/* Avatar upload */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:opacity-90 disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Camera className="h-3 w-3" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Profile Photo</p>
                {uploadProgress !== null ? (
                  <div className="w-40 space-y-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-150"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Click the camera icon to upload
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
