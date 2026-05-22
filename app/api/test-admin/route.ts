import { NextResponse } from 'next/server'

export async function GET() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  
  return NextResponse.json({
    hasAdminEmail: !!adminEmail,
    hasAdminPassword: !!adminPassword,
    adminEmailValue: adminEmail || 'NOT_SET',
    adminPasswordLength: adminPassword?.length || 0,
    adminPasswordPrefix: adminPassword?.substring(0, 5) || 'NOT_SET',
    expectedEmail: 'admin@clicksuporte.com',
    expectedPasswordLength: 16 // 'clicksuporte2026'.length
  })
}
