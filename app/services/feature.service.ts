import type { Feature, FeatureFormData } from '~/types/feature'

export function useFeatureService() {
  const api = useApi()

  function normalizeFeature(item: any): Feature {
    return {
      id: item.id || item._id || item.key || item.feature_key,
      key: item.key || item.feature_key || '',
      name: item.name || item.feature_name || item.key || item.feature_key || '',
      feature_key: item.feature_key || item.key || '',
      feature_name: item.feature_name || item.name || '',
      input_type: item.input_type === 'number' ? 'number' : 'boolean',
      default_value: String(item.default_value ?? (item.input_type === 'number' ? '0' : 'false')),
      created_at: item.created_at,
      updated_at: item.updated_at
    }
  }

  const endpoints = ['/features', '/api/features', '/admin/features']

  async function tryEndpoints<T>(method: 'get' | 'post' | 'patch' | 'delete', subpath = '', body?: any): Promise<T> {
    let lastError: any = null
    for (const ep of endpoints) {
      try {
        const fullPath = `${ep}${subpath}`
        if (method === 'get') return await api.get<T>(fullPath)
        if (method === 'post') return await api.post<T>(fullPath, body)
        if (method === 'patch') return await api.patch<T>(fullPath, body)
        if (method === 'delete') return await api.delete<T>(fullPath)
      } catch (err: any) {
        lastError = err
        if (err?.response?.status === 404) continue
        throw err
      }
    }
    throw lastError
  }

  return {
    async getFeatures(): Promise<Feature[]> {
      const response = await tryEndpoints<any>('get')
      const rawList = Array.isArray(response) ? response : (response?.data || [])
      return rawList.map(normalizeFeature)
    },

    async getFeature(id: string): Promise<Feature> {
      const response = await tryEndpoints<any>('get', `/${id}`)
      const data = response?.data || response
      return normalizeFeature(data)
    },

    async createFeature(data: FeatureFormData) {
      const payload = {
        key: data.key,
        feature_key: data.key,
        name: data.name,
        feature_name: data.name,
        input_type: data.input_type,
        default_value: data.default_value
      }
      return await tryEndpoints<any>('post', '', payload)
    },

    async updateFeature(id: string, data: Partial<FeatureFormData>) {
      const payload: Record<string, any> = {}
      if (data.key !== undefined) {
        payload.key = data.key
        payload.feature_key = data.key
      }
      if (data.name !== undefined) {
        payload.name = data.name
        payload.feature_name = data.name
      }
      if (data.input_type !== undefined) payload.input_type = data.input_type
      if (data.default_value !== undefined) payload.default_value = data.default_value

      try {
        return await tryEndpoints<any>('patch', `/${id}`, payload)
      } catch (err: any) {
        if (err?.response?.status === 405) {
          for (const ep of endpoints) {
            try {
              return await api.put<any>(`${ep}/${id}`, payload)
            } catch (putErr: any) {
              if (putErr?.response?.status === 404) continue
              throw putErr
            }
          }
        }
        throw err
      }
    },

    async deleteFeature(id: string) {
      return await tryEndpoints<any>('delete', `/${id}`)
    }
  }
}
