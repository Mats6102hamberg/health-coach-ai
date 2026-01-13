import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useActivityLogs(userId?: string, limit = 30) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/activity?userId=${userId}&limit=${limit}` : null,
    fetcher
  )

  return {
    activityLogs: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export async function addActivityLog(
  userId: string,
  type: string,
  steps?: number,
  calories?: number,
  duration?: number,
  distance?: number,
  heartRate?: number,
  notes?: string,
  activityDate?: string
) {
  const response = await fetch('/api/activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      type,
      steps,
      calories,
      duration,
      distance,
      heartRate,
      notes,
      activityDate,
    }),
  })
  return response.json()
}

export async function deleteActivityLog(id: string) {
  const response = await fetch(`/api/activity?id=${id}`, {
    method: 'DELETE',
  })
  return response.json()
}
