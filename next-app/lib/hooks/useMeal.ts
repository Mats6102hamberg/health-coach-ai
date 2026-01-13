import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useMealLogs(userId?: string, limit = 30) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/meal?userId=${userId}&limit=${limit}` : null,
    fetcher
  )

  return {
    mealLogs: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export async function addMealLog(
  userId: string,
  mealType: string,
  foodName: string,
  calories: number,
  protein?: number,
  carbs?: number,
  fat?: number,
  fiber?: number,
  rating?: number,
  aiAnalysis?: string,
  photoUrl?: string,
  mealDate?: string
) {
  const response = await fetch('/api/meal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      mealType,
      foodName,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      rating,
      aiAnalysis,
      photoUrl,
      mealDate,
    }),
  })
  return response.json()
}

export async function deleteMealLog(id: string) {
  const response = await fetch(`/api/meal?id=${id}`, {
    method: 'DELETE',
  })
  return response.json()
}
