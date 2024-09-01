import React from 'react'
import { useSWRConfig } from 'swr'
import EmojiPicker from 'emoji-picker-react'
import * as z from 'zod'
import { X, Pencil } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverArrow,
  PopoverAnchor,
  PopoverClose,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { Category } from '../types'
import { Separator } from '@/components/ui/separator'
import { ConfirmDeleteForm } from '@/components/categories/forms'
import { useToast } from '@/components/ui/use-toast'
import { ReassignTransactionsForm } from '@/components/categories/forms'
import { useUpdateCategory } from '@/hooks/categories'
import { extractErrorMessage } from '@/utils/stringUtils'

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
  const [categoryName, setCategoryName] = React.useState<string>('')
  const [parent, setParent] = React.useState<string | null>('')
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

  const parentEditorPopup = () => {
    return (
      <div></div>
    )
  }

  const emojiPopover = () => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex-1">Choose icon</Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-[400px] justify-center" sideOffset={5}>
          <div>
            <EmojiPicker
              className="flex mt-5 h-20"
              skinTonesDisabled={true}
              onEmojiClick={(event) => setSelectedEmoji(event.emoji)}
            />
          </div>
          <PopoverClose className="absolute top-5 right-5">
            <X className="w-4 h-4" />
          </PopoverClose>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div className="flex flex-col">
      <Accordion
        className="bg-gray-100 shadow-sm"
        type="multiple"
      >
        {parentCategories.map((item: Category) => (
          <AccordionItem
            key={item.uuid}
            value={item.uuid}
          >
            <div className="group flex h-10 w-full justify-start items-center bg-sky-100">
              <AccordionTrigger className="flex gap-1 group text-lg">
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </AccordionTrigger>
              <Popover onOpenChange={(open) => onOpenPopup(open, item)}>
                <PopoverTrigger asChild>
                  <span>
                    <Pencil className="hidden group-hover:flex w-7 h-7 ml-3 p-1 cursor-pointer hover:text-blue-400" />
                  </span>
                </PopoverTrigger>
                <PopoverAnchor />
                <PopoverContent className="flex flex-col gap-3 w-80 rounded-md bg-white border-none" sideOffset={10}>
                  <PopoverClose className="absolute top-5 right-5">
                    <X className="w-4 h-4" />
                  </PopoverClose>
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
                  <PopoverArrow width={20} height={10} className="fill-white shadow-lg border-none" />
                </PopoverContent>
              </Popover>
            </div>
            <AccordionContent>
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
                          <Popover onOpenChange={(open) => onOpenPopup(open, category)}>
                            <PopoverTrigger asChild>
                              <span>
                                <Pencil className="hidden group-hover:flex w-6 h-6 ml-3 px-1 cursor-pointer hover:text-blue-400" />
                              </span>
                            </PopoverTrigger>
                            <PopoverAnchor />
                            <PopoverContent className="flex flex-col gap-3 w-80 rounded-md bg-white border-none" sideOffset={10}>
                              <PopoverClose className="absolute top-5 right-5">
                                <X className="w-4 h-4" />
                              </PopoverClose>
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
                                <Select
                                  onValueChange={setParent}
                                  defaultValue={category.parent}
                                  disabled={isUpdating}
                                >
                                  <SelectTrigger className="relative w-full">
                                    <SelectValue placeholder="Choose parent category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      {parentCategories.map((category: Category) => (
                                        <SelectItem key={category.uuid} value={category.uuid}>{category.name}</SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
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
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <ReassignTransactionsForm uuid={category.uuid} />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Re-assign transactions and budgets from this category to another one
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <ConfirmDeleteForm uuid={category.uuid} />
                              </div>
                              <PopoverArrow width={20} height={10} className="fill-white shadow-lg border-none" />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    ))}
                  </>
                )
                : <div className="flex h-full w-full p-5 justify-center text-slate-300">
                  <span className="text-center">Need to add at least one subcategory</span>
                </div>
              }
            </AccordionContent>
          </AccordionItem >
        ))}
      </Accordion >
    </div >
  )
}

export default Outcome
