import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useWeightLogs(userId?: string, limit = 30) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/weight?userId=${userId}&limit=${limit}` : null,
    fetcher
  )

  return {
    weightLogs: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export async function addWeightLog(
  userId: string,
  weight: number,
  bodyFat?: number,
  muscle?: number,
  notes?: string
) {
  const response = await fetch('/api/weight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, weight, bodyFat, muscle, notes }),
  })
  return response.json()
}

export async function deleteWeightLog(id: string) {
  const response = await fetch(`/api/weight?id=${id}`, {
    method: 'DELETE',
  })
  return response.json()
}
