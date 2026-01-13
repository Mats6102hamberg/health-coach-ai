import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useUser(email?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    email ? `/api/user?email=${email}` : null,
    fetcher
  )

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export async function createUser(email: string, name: string) {
  const response = await fetch('/api/user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name }),
  })
  return response.json()
}
