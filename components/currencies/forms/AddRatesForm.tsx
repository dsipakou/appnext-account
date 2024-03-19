import React from 'react'
import InputMask from 'react-input-mask'
import axios from 'axios'
import { useSWRConfig } from 'swr'
import { useForm } from 'react-hook-form'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useRatesOnDate, RateResponse } from '@/hooks/rates'
import { getFormattedDate } from '@/utils/dateUtils'
import { Currency, RatePostRequest, RateItemPostRequest } from '../types'

interface Types {
  currencies: Currency[]
}

interface FormData {
  rateDate: Date
  [dynamicKey: string]: number | string
}

const AddRatesForm: React.FC<Types> = ({ currencies = [] }) => {
  const { mutate } = useSWRConfig()
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [errors, setErrors] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const form = useForm<FormData>()
  const { data: ratesOnDate = [], url } = useRatesOnDate(getFormattedDate(selectedDate))

  const { toast } = useToast()

  React.useEffect(() => {
    form.setValue('rateDate', selectedDate)
    if (currencies.length > 0) {
      currencies.forEach((item: Currency) => {
        form.setValue(item.uuid, '')
      })
    }

    if (ratesOnDate.length === 0) return

    ratesOnDate.forEach((item: RateResponse) => {
      form.setValue(item.currency, item.rate)
    })
  }, [selectedDate, ratesOnDate])

  const changeDate = (day: Date | undefined) => {
    if (day != null) {
      setSelectedDate(day)
    }
  }

  const getBaseCurrency = (): Currency => {
    return currencies.find((item: Currency) => item.isBase)!
  }

  const prepareSaveRequest = (formData: FormData): RatePostRequest => {
    const requestPayload: RatePostRequest = {
      baseCurrency: getBaseCurrency().uuid,
      items: [],
      rateDate: getFormattedDate(formData.rateDate)
    }

    Object.keys(formData).forEach((uuid: string) => {
      if (uuid === 'rateDate') return

      const normalizedRate: number = typeof formData[uuid] === 'number'
        ? Number(formData[uuid])
        : Number(String(formData[uuid]).replace(/[^0-9.]/g, ''))
      const rateItem: RateItemPostRequest = {
        currency: uuid,
        rate: String(normalizedRate)
      }
      if (normalizedRate !== 0) requestPayload.items.push(rateItem)
    })

    return requestPayload
  }

  const handleSave = (formData: FormData): void => {
    setIsLoading(true)

    const payload = prepareSaveRequest(formData)

    axios.post('rates/batched/', {
      ...payload
    }).then(
      res => {
        if (res.status === 200) {
          mutate(url)
          toast({
            title: 'Saved!'
          })
        } else {
          // TODO: handle errors
        }
      }
    ).catch(
      (error) => {
        const errRes = error.response.data
        for (const prop in errRes) {
          toast({
            variant: 'destructive',
            title: 'Something went wrong',
            description: prop
          })
          setErrors(errRes[prop])
        }
      }
    ).finally(() => {
      setIsLoading(false)
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild className="mx-2">
        <Button variant="outline" className="text-blue-500 border-blue-500 hover:text-blue-600">+ Add rates</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add or update rates for currencies</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
            <div className="flex space-y-3">
              <div className="flex flex-col space-y-2 w-1/3">
              {
                currencies.map((item: Currency) => (!item.isBase && (
                  <div className="flex" key={item.uuid}>
                    <FormField
                      control={form.control}
                      name={item.uuid}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <InputMask
                              mask='9.9999'
                              disabled={isLoading}
                              {...field}
                            >
                              {() => (
                                <Input className="w-20" />
                              )}
                            </InputMask>
                          </FormControl>
                          <FormLabel>{item.sign}</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                )))
              }
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="rateDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Calendar
                          disabled={isLoading}
                          mode="single"
                          selected={field.value}
                          onSelect={changeDate}
                          weekStartsOn={1}
                          initialFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button disabled={isLoading} variant="default" type="submit">Save</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddRatesForm
