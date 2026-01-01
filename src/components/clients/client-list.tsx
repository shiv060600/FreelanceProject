'use client'

import { useState, useMemo } from "react"
import { Client } from "@/types/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2, Eye, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchInput } from "@/components/ui/search-input"
import { SortHeader } from "@/components/ui/sort-header"
import EditClientDialog from "./edit-client-dialog"
import DeleteClientDialog from "./delete-client-dialog"
import ClientDetailDialog from "./client-detail-dialog"

interface ClientListProps {
  clients: Client[]
}

type SortDirection = 'asc' | 'desc' | null

export default function ClientList({ clients }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: SortDirection }>({
    key: 'created_at',
    direction: 'desc'
  })

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        // Cycle through: desc -> asc -> null -> desc
        if (prevConfig.direction === 'desc') return { key, direction: 'asc' }
        if (prevConfig.direction === 'asc') return { key: null, direction: null }
        return { key, direction: 'desc' }
      }
      return { key, direction: 'desc' }
    })
  }

  const filteredAndSortedClients = useMemo(() => {
    let result = [...clients]

    // Filter by search term
    if (searchTerm) {
      result = result.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Sort
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof Client]
        let bValue: any = b[sortConfig.key as keyof Client]

        // Handle different data types
        if (sortConfig.key === 'created_at') {
          aValue = new Date(aValue).getTime()
          bValue = new Date(bValue).getTime()
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [clients, searchTerm, sortConfig])
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-lg p-4 border border-blue-100/50">
        <div className="flex items-center gap-4 flex-1">
          <SearchInput
            placeholder="Search clients by name, company, or email..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="max-w-md bg-white shadow-sm"
          />
          {searchTerm && (
            <span className="text-sm font-medium text-gray-700 bg-white px-3 py-1.5 rounded-md shadow-sm">
              {filteredAndSortedClients.length} of {clients.length} clients
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-gray-50/50 border-b border-gray-200">
              <TableHead className="text-sm font-semibold text-gray-700 py-4 px-6">
                <SortHeader 
                  sortKey="name" 
                  currentSort={sortConfig} 
                  onSort={handleSort}
                >
                  Name
                </SortHeader>
              </TableHead>
              <TableHead className="text-sm font-semibold text-gray-700 py-4 px-6">
                <SortHeader 
                  sortKey="company" 
                  currentSort={sortConfig} 
                  onSort={handleSort}
                >
                  Company
                </SortHeader>
              </TableHead>
              <TableHead className="text-sm font-semibold text-gray-700 py-4 px-6">
                <SortHeader 
                  sortKey="email" 
                  currentSort={sortConfig} 
                  onSort={handleSort}
                >
                  Email
                </SortHeader>
              </TableHead>
              <TableHead className="text-sm font-semibold text-gray-700 py-4 px-6">Phone</TableHead>
              <TableHead className="text-sm font-semibold text-gray-700 py-4 px-6">
                <SortHeader 
                  sortKey="created_at" 
                  currentSort={sortConfig} 
                  onSort={handleSort}
                >
                  Added
                </SortHeader>
              </TableHead>
              <TableHead className="text-sm font-semibold text-gray-700 py-4 px-6 text-right w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100">
            {filteredAndSortedClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    {clients.length === 0 ? (
                      <>
                        <Users className="h-12 w-12 mb-3 opacity-50" />
                        <p className="text-base font-medium">No clients yet. Add your first client to get started.</p>
                      </>
                    ) : (
                      <>
                        <Users className="h-12 w-12 mb-3 opacity-50" />
                        <p className="text-base font-medium">No clients found matching your search.</p>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedClients.map((client) => (
                <TableRow key={client.id} className="hover:bg-blue-50/30 transition-colors duration-150 border-b border-gray-100">
                  <TableCell className="font-semibold text-gray-900 py-4 px-6">
                    <ClientDetailDialog client={client}>
                      <button className="hover:text-blue-600 transition-colors text-left">{client.name}</button>
                    </ClientDetailDialog>
                  </TableCell>
                  <TableCell className="text-gray-700 py-4 px-6">{client.company || '-'}</TableCell>
                  <TableCell className="text-gray-700 py-4 px-6">{client.email || '-'}</TableCell>
                  <TableCell className="text-gray-700 py-4 px-6">{client.phone || '-'}</TableCell>
                  <TableCell className="text-gray-600 py-4 px-6">{format(new Date(client.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <ClientDetailDialog client={client}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        </ClientDetailDialog>
                        <EditClientDialog client={client}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </EditClientDialog>
                        <DeleteClientDialog client={client}>
                          <DropdownMenuItem 
                            onSelect={(e) => e.preventDefault()} 
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DeleteClientDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 