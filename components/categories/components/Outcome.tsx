// System
import React from 'react'
import { useSWRConfig } from 'swr'
import EmojiPicker from 'emoji-picker-react'
import * as z from 'zod'
import { X, Pencil, ScrollText } from 'lucide-react'
// Components
import { TransactionsForm } from '@/components/categories/forms'
import { ReassignTransactionsForm } from '@/components/categories/forms'
import { ConfirmDeleteForm } from '@/components/categories/forms'
// UI
import { Button } from '@/components/ui/button'
import * as Acd from "@/components/ui/accordion"
import * as Ppv from '@/components/ui/popover'
import * as Slc from '@/components/ui/select'
import * as Tlt from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
// Hooks
import { useUpdateCategory } from '@/hooks/categories'
// Utils
import { extractErrorMessage } from '@/utils/stringUtils'
// Types
import { Category } from '../types'

interface Types {
  parentCategories: Category[]
  categoriesByParent: (uuid: string) => {}
}

interface PopupTypes {
  uuid: string
  name: string
  parent: string | null
  description: string | null
}

const popupSchema = z.object({
  name: z.string().min(2),
  parent: z.string().uuid().nullable(),
  description: z.string().optional()
})

const Outcome: React.FC<Types> = ({ parentCategories, categoriesByParent }) => {
  const [errors, setErrors] = React.useState<string>('')
  const [uuid, setUuid] = React.useState<string>('')
  const [activeCategoryUuid, setActiveCategoryUuid] = React.useState<string>('')
  const [categoryName, setCategoryName] = React.useState<string>('')
  const [parent, setParent] = React.useState<string | null>('')
  const [isOpenTransactionsForm, setIsOpenTransactionsForm] = React.useState<boolean>(false)
  const [selectedEmoji, setSelectedEmoji] = React.useState<string | null>(null)

  const { toast } = useToast()
  const { mutate } = useSWRConfig()
  const { trigger: updateCategory, isMutating: isUpdating } = useUpdateCategory(uuid)

  const onOpenPopup = (open: boolean, category: Category) => {
    if (open) {
      setUuid(category.uuid)
      setCategoryName(category.name)
      setParent(category.parent)
      setSelectedEmoji(category.icon)
    }
  }

  const clickShowTransactions = (categoryUuid: string) => {
    setActiveCategoryUuid(categoryUuid)
    setIsOpenTransactionsForm(true)
  }

  const handleCloseModal = () => {
    setIsOpenTransactionsForm(false)
    setActiveCategoryUuid('')
  }

  const handleSave = async (payload: PopupTypes, originalName: string) => {
    const validatedPayload = popupSchema.safeParse(payload)

    if (!validatedPayload.success) {
      for (const err in validatedPayload.error.issues) {
        setErrors(err)
      }

      toast({
        variant: 'destructive',
        title: 'Please, check your input',
        description: errors.toString(),
      })
    }

    if (validatedPayload.data.name === originalName) {
      delete validatedPayload.data.name
    }

    try {
      await updateCategory({
        ...validatedPayload.data,
        icon: selectedEmoji
      })
      mutate('categories/')
      toast({
        title: 'Category updated'
      })
    } catch (error) {
      const message = extractErrorMessage(error)
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: message,
      })
    }
  }

  const emojiPopover = () => {
    return (
      <Ppv.Popover>
        <Ppv.PopoverTrigger asChild>
          <Button variant="outline" className="flex-1">Choose icon</Button>
        </Ppv.PopoverTrigger>
        <Ppv.PopoverContent className="flex w-[400px] justify-center" sideOffset={5}>
          <div>
            <EmojiPicker
              className="flex mt-5 h-20"
              skinTonesDisabled={true}
              onEmojiClick={(event) => setSelectedEmoji(event.emoji)}
            />
          </div>
          <Ppv.PopoverClose className="absolute top-5 right-5">
            <X className="w-4 h-4" />
          </Ppv.PopoverClose>
        </Ppv.PopoverContent>
      </Ppv.Popover>
    )
  }

  return (
    <>
      <div className="flex flex-col">
        <Acd.Accordion
          type="multiple"
        >
          {parentCategories.map((item: Category) => (
            <Acd.AccordionItem
              key={item.uuid}
              value={item.uuid}
            >
              <div className="group flex h-12 w-full justify-start shadow-lg items-center bg-white">
                <Acd.AccordionTrigger className="flex gap-1 group text-lg">
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Acd.AccordionTrigger>
                <Ppv.Popover onOpenChange={(open) => onOpenPopup(open, item)}>
                  <Ppv.PopoverTrigger asChild>
                    <span>
                      <Pencil className="hidden group-hover:flex w-7 h-7 ml-3 p-1 cursor-pointer hover:text-blue-400" />
                    </span>
                  </Ppv.PopoverTrigger>
                  <Ppv.PopoverAnchor />
                  <Ppv.PopoverContent className="flex flex-col gap-3 w-80 rounded-md bg-white border-none" sideOffset={10}>
                    <Ppv.PopoverClose className="absolute top-5 right-5">
                      <X className="w-4 h-4" />
                    </Ppv.PopoverClose>
                    <span className="text-lg">Editing</span>
                    <div className="flex justify-between">
                      <div className="flex justify-center w-1/2">
                        {selectedEmoji && (
                          <>
                            <span className="flex justify-center items-center text-2xl">{selectedEmoji}</span>
                            <Button variant="link" onClick={() => setSelectedEmoji(null)}>
                              <X className="w-4 h-4 mr-2" />
                            </Button>
                          </>
                        )}
                      </div>
                      <div>
                        {emojiPopover()}
                      </div>
                    </div>
                    <div>
                      <Input id="name" className="w-full" defaultValue={item.name} onChange={(event) => setCategoryName(event.target.value)} />
                    </div>
                    <div className="flex items-end mt-2 justify-between">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={item.icon === selectedEmoji && (!categoryName || categoryName === item.name)}
                          onClick={() => handleSave({ ...item, name: categoryName || item.name }, item.name)}
                        >
                          Save
                        </Button>
                      </div>
                      <ConfirmDeleteForm uuid={item.uuid} />
                    </div>
                    <Ppv.PopoverArrow width={20} height={10} className="fill-white shadow-lg border-none" />
                  </Ppv.PopoverContent>
                </Ppv.Popover>
              </div>
              <Acd.AccordionContent className="bg-white ml-2 pb-1 mb-2">
                {(categoriesByParent(item.uuid).length > 0)
                  ? (
                    <>
                      {categoriesByParent(item.uuid).map((category: Category) => (
                        <div key={category.uuid}>
                          <Separator />
                          <div className="group flex flex-nowrap my-1 p-1" key={category.uuid}>
                            <span className="flex items-center ml-8 h-6">
                              {category.name}
                            </span>
                            <span>
                              <ScrollText
                                className="hidden group-hover:flex w-6 h-6 ml-3 p-1 cursor-pointer hover:text-blue-400"
                                onClick={() => clickShowTransactions(category.uuid)}
                              />
                            </span>
                            <Ppv.Popover onOpenChange={(open) => onOpenPopup(open, category)}>
                              <Ppv.PopoverTrigger asChild>
                                <span>
                                  <Pencil className="hidden group-hover:flex w-6 h-6 ml-3 px-1 cursor-pointer hover:text-blue-400" />
                                </span>
                              </Ppv.PopoverTrigger>
                              <Ppv.PopoverAnchor />
                              <Ppv.PopoverContent className="flex flex-col gap-3 w-80 rounded-md bg-white border-none" sideOffset={10}>
                                <Ppv.PopoverClose className="absolute top-5 right-5">
                                  <X className="w-4 h-4" />
                                </Ppv.PopoverClose>
                                <span className="text-lg">Editing</span>
                                <div className="flex justify-between">
                                  <div className="flex justify-center w-1/2">
                                    {selectedEmoji && (
                                      <>
                                        <span className="flex justify-center items-center text-2xl">{selectedEmoji}</span>
                                        <Button variant="link" onClick={() => setSelectedEmoji(null)}>
                                          <X className="w-4 h-4 mr-2" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                  <div>
                                    {emojiPopover()}
                                  </div>
                                </div>
                                <div>
                                  <Slc.Select
                                    onValueChange={setParent}
                                    defaultValue={category.parent}
                                    disabled={isUpdating}
                                  >
                                    <Slc.SelectTrigger className="relative w-full">
                                      <Slc.SelectValue placeholder="Choose parent category" />
                                    </Slc.SelectTrigger>
                                    <Slc.SelectContent>
                                      <Slc.SelectGroup>
                                        {parentCategories.map((category: Category) => (
                                          <Slc.SelectItem key={category.uuid} value={category.uuid}>{category.name}</Slc.SelectItem>
                                        ))}
                                      </Slc.SelectGroup>
                                    </Slc.SelectContent>
                                  </Slc.Select>
                                </div>
                                <div>
                                  <Input id="name" className="w-full" defaultValue={category.name} onChange={(event) => setCategoryName(event.target.value)} />
                                </div>
                                <div className="flex items-end mt-2 justify-between">
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      disabled={!categoryName || (category.icon === selectedEmoji && categoryName === category.name && parent === category.parent)}
                                      onClick={() => handleSave({
                                        ...category,
                                        name: categoryName || category.name,
                                        parent: parent || category.parent,
                                      },
                                        category.name)}
                                    >
                                      Save
                                    </Button>
                                    <Tlt.TooltipProvider>
                                      <Tlt.Tooltip>
                                        <Tlt.TooltipTrigger>
                                          <ReassignTransactionsForm uuid={category.uuid} />
                                        </Tlt.TooltipTrigger>
                                        <Tlt.TooltipContent>
                                          Re-assign transactions and budgets from this category to another one
                                        </Tlt.TooltipContent>
                                      </Tlt.Tooltip>
                                    </Tlt.TooltipProvider>
                                  </div>
                                  <ConfirmDeleteForm uuid={category.uuid} />
                                </div>
                                <Ppv.PopoverArrow width={20} height={10} className="fill-white shadow-lg border-none" />
                              </Ppv.PopoverContent>
                            </Ppv.Popover>
                          </div>
                        </div>
                      ))}
                    </>
                  )
                  : <div className="flex h-full w-full p-5 justify-center text-slate-300">
                    <span className="text-center">Need to add at least one subcategory</span>
                  </div>
                }
              </Acd.AccordionContent>
            </Acd.AccordionItem>
          ))}
        </Acd.Accordion>
      </div>
      {activeCategoryUuid && (
        <TransactionsForm
          open={isOpenTransactionsForm}
          handleClose={handleCloseModal}
          uuid={activeCategoryUuid}
        />
      )}
    </>
  )
}

export default Outcome
