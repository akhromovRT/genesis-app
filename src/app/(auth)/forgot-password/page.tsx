import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Восстановление пароля</CardTitle>
        <CardDescription>
          Для сброса пароля обратитесь к администратору по email: info@genesis-health.ru
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Link href="/login" className="w-full">
          <Button variant="outline" className="w-full">Вернуться к входу</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
