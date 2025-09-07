'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function SignupPage() {
  const router = useRouter()
  const { signUp } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await signUp(values.name, values.email, values.password)
      router.push('/')
    } catch {
      form.setError('root', {
        type: 'manual',
        message: 'Failed to sign up. Please try again.',
      })
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {/* Red radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(197,5,12,0.18),transparent_60%)]"
      />
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/60 backdrop-blur shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight text-zinc-100">
            Create your account
          </CardTitle>
          <p className="text-sm text-zinc-400">
            Join the UW–Madison Curling Club
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your name"
                        className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@wisc.edu"
                        className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root && (
                <p className="text-sm font-medium text-red-400">
                  {form.formState.errors.root.message}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-red-600 text-white hover:bg-red-500"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Signing up...' : 'Sign Up'}
              </Button>
            </form>
          </Form>

          <Separator className="my-6 bg-zinc-800" />

          <div className="text-center text-sm text-zinc-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-red-400 hover:text-red-300"
            >
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}