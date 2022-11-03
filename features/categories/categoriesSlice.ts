import {
  createSlice,
  createEntityAdapter,
  createSelector
} from '@reduxjs/toolkit'

import { apiSlice } from '../api/apiSlice'

export const selectCategoriesResult = apiSlice.endpoints.getCategories.select()

const emptyCategories: any[] = []

export const selectAllCategories = createSelector(
  selectCategoriesResult,
  categoriesResult => categoriesResult?.data ?? emptyCategories
)

export const selectCategoryByUuid = createSelector(
  selectAllCategories,
  (state: any, categoryUuid: string): string => categoryUuid,
  (categories: any[], categoryUuid: string): any => categories.find(category => category.uuid === categoryUuid)
)

export const selectParentCategories = createSelector(
  selectAllCategories,
  categories => categories.filter((category: any) => category.parent === null),
)

export const selectChildrenCategories = createSelector(
  selectAllCategories,
  (state: any, categoryUuid: string): string => categoryUuid,
  (categories: any[], categoryUuid: string): any => categories.filter(category => category.parent === categoryUuid)
)
