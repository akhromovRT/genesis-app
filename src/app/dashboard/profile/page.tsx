"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setForm({
          fullName: profile.full_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.fullName,
        phone: form.phone,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Ошибка сохранения профиля");
    } else {
      toast.success("Профиль обновлён");
    }
    setSaving(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error("Минимум 6 символов");
      return;
    }

    setChangingPassword(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: passwords.newPassword,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Пароль изменён");
      setPasswords({ newPassword: "", confirmPassword: "" });
    }
    setChangingPassword(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Профиль</h1>
      <p className="mt-1 text-muted-foreground">
        Управление личными данными и паролем
      </p>

      <div className="mt-8 space-y-8">
        {/* Personal info */}
        <Card>
          <CardHeader>
            <CardTitle>Личные данные</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={form.email} disabled />
                <p className="text-xs text-muted-foreground">
                  Email изменить нельзя
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Имя и фамилия</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fullName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  "Сохранить"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* Change password */}
        <Card>
          <CardHeader>
            <CardTitle>Смена пароля</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Новый пароль</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Минимум 6 символов"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords((p) => ({
                      ...p,
                      newPassword: e.target.value,
                    }))
                  }
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Повторите пароль</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords((p) => ({
                      ...p,
                      confirmPassword: e.target.value,
                    }))
                  }
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" variant="outline" disabled={changingPassword}>
                {changingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  "Изменить пароль"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
