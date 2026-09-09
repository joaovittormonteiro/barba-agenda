import Link from 'next/link'; import { AuthForm } from '@/components/auth-form'
export default function SignupPage() { return <><AuthForm mode="signup" /><p className="mt-3 text-center">Já tem conta? <Link className="underline" href="/login">Entrar</Link></p></> }
