import { getInitialState } from 'api/initial-state/initial-state';
import { getRouteValidationScheme } from 'lib/router/router';
import createValidation from 'svelidation';
import { useRoute } from 'lib/router/router';
import { Writable } from 'svelte/store';

export const { validationRules: rules }: InitialData = getInitialState('initialData');

type ValidationOptions = {
  cb?();
  assignPayload?(payload: Payload): Payload;
  scheme?: PayloadSchemeType[];
  initialValues?: {
    [key: string]: any;
  };
};

interface CreateValidationResult {
  form: {
    use: UseFunction;
    onSuccess(values);
  };
  entries: {
    [key in PayloadSchemeType]: [
      Writable<{ [key: string]: any }[]>,
      Writable<any>,
      UseFunction
    ];
  };
  validate(): any[];
  getValues(): any[]
}

export const defaultValidationOptions = {
  presence: 'required',
  trim: true,
  validateOnEvents: { input: true },
  clearErrorsOnEvents: { focus: true },
  useCustomErrorsStore: (errors, params) => {
    return errors.reduce((result, ruleName) => {
      result[ruleName] = params[ruleName];
      return result;
    }, {});
  },
  getValues: entries => {
    return entries.reduce((result, { value, params }) => {
      result[params.id] = value;
      return result;
    }, {});
  },
};

export default (validationParams: {params?: Params} & RouteId, options: ValidationOptions = {}): CreateValidationResult => {
  const { createForm, createEntries, validate, getValues } = createValidation(defaultValidationOptions);

  const scheme: PayloadSchemeType[] = options.scheme || getRouteValidationScheme(validationParams);
  const cb = typeof options === 'function' ? options : options.cb;
  const initialValues = options.initialValues || [];

  const onSuccess = (payload?: Payload) => {
    if (typeof options.assignPayload === 'function') {
      payload = options.assignPayload(payload);
    }

    useRoute({
      ...validationParams,
      payload
    }, cb);
  };

  return {
    getValues,
    validate,
    form: { use: createForm, onSuccess },
    entries: createEntries(scheme.reduce((result, entryId) => {
      result[entryId] = {
        ...rules[entryId],
        id: entryId
      };

      if (initialValues[entryId]) {
        result[entryId].value = initialValues[entryId];
      }

      return result;
    }, {}))
  }
};
