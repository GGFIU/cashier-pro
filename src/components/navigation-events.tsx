
'use client'
 
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
 
export function NavigationEvents() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
 
  useEffect(() => {
    // You can do anything you want here, like triggering analytics events
    console.log(`Navigation to: ${pathname}?${searchParams}`)
  }, [pathname, searchParams])
 
  return null
}
