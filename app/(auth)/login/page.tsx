import Link from 'next/link'; import { AuthForm } from '@/components/auth-form'
export default function LoginPage() { return <><AuthForm mode="login" /><p className="mt-3 text-center">Ainda não tem conta? <Link className="underline" href="/cadastro">Cadastre-se</Link></p></> }
