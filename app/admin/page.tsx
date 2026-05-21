'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error)
        return
      }

      // Salvar token
      localStorage.setItem('admin_token', data.token)
      router.push('/admin/dashboard')
    } catch (err) {
      setError('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
              <span className="text-2xl font-black text-black">C</span>
            </div>
            <span className="text-2xl font-bold">Click<span className="text-accent">Suporte</span></span>
          </div>
          <h1 className="text-xl font-semibold text-white/90">Admin Panel</h1>
          <p className="text-sm text-white/50 mt-2">Faça login para acessar o dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="bg-secondary border border-border rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-border-hover transition"
                placeholder="admin@clicksuporte.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-border-hover transition"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 px-6 py-3 bg-accent text-black font-semibold rounded-xl hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="mt-6 text-center text-xs text-white/30">
            Credenciais padrão no .env.local
          </p>
        </form>
      </div>
    </div>
  )
}
