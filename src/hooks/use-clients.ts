import { useQuery,useMutation,useQueryClient } from '@tanstack/react-query'
import { createClient } from '../../supabase/client'

export interface Client {
  id: string
  user_id: string
  name: string
  email?: string
  phone?: string
  company?: string
  address?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateClientData {
  name:string
  email:string
  phone:string
  company:string
  address:string
  notes:string
  user_id:string
}

export interface UpdateClientData {
  name:string,
  email:string,
  phone:string,
  company:string,
  address:string,
  notes:string
}

const supabase = createClient();


export function useClients(userId:string){
  return useQuery({
    queryKey: ['clients',userId],
    queryFn: async(): Promise<Client[]> => {
      const {data,error} = await supabase
        .from('clients')
        .select('*')
        .eq('user_id',userId)
        .order('created_at',{ascending:false})
      if(!data || error) throw error
      return data
    },
    enabled: !!userId
  })
}

export function useCreateClient(){
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async(clientData:CreateClientData) => {
      const {data,error} = await supabase
        .from('clients')
        .insert([clientData])
        .select('*')
        .single()
      if(!data || error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({queryKey:['clients',variables.user_id]})
    }
  })
}

export function useEditClient({clientId,userId}:{clientId:string,userId:string}){
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async(updateClientData:Partial<UpdateClientData>) => {
      const {error} = await supabase
        .from('clients')
        .update({...updateClientData})
        .eq('id',clientId)
        .eq('user_id',userId)
      if(error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey:['clients',userId]})
    }
  })
}

export function useDeleteClient({clientId,userId}:{clientId:string,userId:string}){
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async() => {
      const {error} = await supabase
        .from('clients')
        .delete()
        .eq('id',clientId)
        .eq('user_id',userId)
      if(error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey:['clients',userId]})
    }
  })
}

