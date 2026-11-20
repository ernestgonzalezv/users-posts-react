import type { AppError } from '../../core/app-error'
import type { Translate } from '../../i18n/translate'

export const errorMessage = (t: Translate, error: AppError): string => {
  switch (error.kind) {
    case 'network':
      return t('error.network')
    case 'timeout':
      return t('error.timeout')
    case 'http':
      return t('error.http', { status: error.status })
    case 'parse':
      return t('error.parse')
    case 'aborted':
      return t('error.aborted')
    case 'validation':
      return t('error.validation')
  }
}
