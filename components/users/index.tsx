import React from 'react'
import axios from 'axios'
import { useSWRConfig } from 'swr'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useInvites, UserResponse, useUsers } from '@/hooks/users'
import { useRoles, Roles } from '@/hooks/roles'
import { User, Invite } from '@/components/users/types'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import AddForm from './forms/AddForm'
import ConfirmRevokeForm from './forms/ConfirmRevokeForm'

interface RoleMap {
  [userUuid: string]: string
}

const Index: React.FC = () => {
  const [selectedRoles, setSelectedRoles] = React.useState<RoleMap[]>({})
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [errors, setErrors] = React.useState<string>('')
  const { data: users = [] } = useUsers()
  const { data: { user: authUser } } = useSession()
  const { data: roles = []} = useRoles()
  const { data: invites = [] } = useInvites()

  const { toast } = useToast()
  const { mutate } = useSWRConfig()

  const me = users.find((item: User) => item.username === authUser.username)

  const members = users.filter((item: User) => item.username !== authUser.username)

  React.useEffect (() => {
    if (!members.length) return

    users.forEach((item: UserResponse) => {
      setSelectedRoles((state) => ({...state, [item.uuid]: item.role}))
    })
  }, [users])

  const isYou = (user: User) => user.username === authUser.username

  const selectRole = (uuid: string, role: string) => {
    setSelectedRoles((state) => ({...state, [uuid]: role}))
  }

  const updateRole = (userUuid: string) => {
    setIsLoading(true)
    if (!selectedRoles[userUuid]) return

    axios.patch(`users/role/${userUuid}/`, {
      role: selectedRoles[userUuid]
    }).then((res) => {
      if (res.status === 200) {
        mutate('users/')
        toast({
          title: 'User role updated'
        })
      } else {
        // TODO: handle errors
      }
    })
    .catch((error) => {
      const errRes = error.response.data
      for (const prop in errRes) {
        setErrors(errRes[prop])
      }
      toast({
        variant: 'destructive',
        title: 'Failed',
        description: errors.toString()
      })
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  return (
    <div className="flex flex-col">
      <div className="flex w-full px-6 my-3 justify-between items-center">
        <span className="text-xl font-semibold">User management</span>
        <AddForm />
      </div>
      <div className="flex flex-col w-full mt-6 px-20 gap-4">
        { (me != null) && (
          <div className="flex flex-col bg-white p-2 rounded-md w-full drop-shadow">
            <span className="text-lg font-semibold p-2">Workspace owner</span>
            <div className="flex my-1 w-full bg-slate-100 justify-left items-center p-4 gap-4">
              <span className="text-lg font-semibold">{me.username}</span>
              {isYou(me) && <span className="text-md">(this is you)</span>}
            </div>
          </div>
        )}
        { members && (
          <div className="flex flex-col bg-white p-2 rounded-md w-full drop-shadow">
            <span className="text-lg p-2">Members</span>
            {members.map((item: UserResponse) => (
              <div key={item.uuid} className="flex my-1 w-full bg-slate-100 justify-between items-center p-4 gap-4">
                <div className="flex gap-4 items-center">
                  <span className="text-lg font-semibold">{item.username}</span>
                  <span className="italic text-sky-500">{item.role}</span>
                </div>
                {isYou(item) ? 
                  (
                    <span className="text-md">(this is you)</span>
                  ) : 
                  (
                    <div className="flex items-center gap-3">
                      <Select
                        defaultValue={item.role}
                        onValueChange={(value) => selectRole(item.uuid, value)}
                      >
                        <SelectTrigger className="relative bg-white w-40">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Roles</SelectLabel>
                            {roles.map((item: Roles, index: number) => (
                              <SelectItem key={index} value={item.name}>{item.name}</SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <Button
                        disabled={selectedRoles[item.uuid] === item.role || isLoading}
                        onClick={() => updateRole(item.uuid)}
                      >
                        Update role
                      </Button>
                    </div>
                  )
                }
              </div>
            ))}
          </div>
        )}
        { invites && (
          <div className="flex flex-col bg-white divide-y">
            <span className="text-lg p-2">Invites</span>
            {invites.length == 0 && (
              <div className="flex my-1 w-full justify-left items-center p-4 gap-4">
                You do not have active invites
              </div>
            )}
            {invites.map((invite: Invite) => (
              <div key={invite.uuid} className="flex my-1 w-full justify-left items-center p-4 gap-4">
                <div className="flex flex-1">{invite.inviteReciever}</div>
                <div className="flex flex-1 justify-end">
                  <ConfirmRevokeForm uuid={invite.uuid} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Index
