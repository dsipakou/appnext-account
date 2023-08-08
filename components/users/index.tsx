import React from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useUsers } from '@/hooks/users'
import { User } from '@/components/users/types'

const Index: React.FC = () => {
  const { data: users = [] } = useUsers()
  const { data: { user: authUser }} = useSession()

  const me = users.find((item: User) => item.username === authUser.username)

  const members = users.filter((item: User) => item.username !== authUser.username)
  
  const isYou = (user: User) => user.username === authUser.username

  return (
    <div className="flex flex-col">
      <div className="flex w-full px-6 my-3 justify-between items-center">
        <span className="text-xl font-semibold">User management</span>
        <Button>Add user to workspace</Button>
      </div>
      <div className="flex flex-col w-full mt-6 px-20 gap-4">
        { me && (
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
            {members.map((item: User) => (
              <div className="flex my-1 w-full bg-slate-100 justify-left items-center p-4 gap-4">
                <span className="text-lg font-semibold">{item.username}</span>
                {isYou(item) && <span className="text-md">(this is you)</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Index
