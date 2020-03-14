import { getInitialState } from 'api/get-initial-state/get-initial-state';
import createValidation from 'svelidation';
import { Writable } from 'svelte/store';

const { validationRules: rules } = getInitialState();

type ValidationOption = {
  scheme: string[];
  initial?: {
    [key: string]: any;
  };
  validationOptions?: {
    [key: string]: any;
  }
};

type Validation = {
  clearErrors(includeAllEntries?: boolean);
  form: {
    use: UseFunction;
    onSuccess(values);
  };
  entries: {
    [key in PayloadSchemeType]: [
      Writable<string[]>,
      Writable<string>,
      UseFunction
    ];
  };
}

export default (options: ValidationOption, callback): Validation => {
  const { validationOptions = {}, scheme, initial = {} } = options;
  const { createForm, createEntries, clearErrors } = createValidation(Object.assign({
    presence: 'required',
    trim: true,
    getValues: entries => {
      return entries.reduce((result, { value, params }) => {
        result[params.id] = value;
        return result;
      }, {});
    }
  }, validationOptions));

  return {
    clearErrors,
    form: { use: createForm, onSuccess: callback },
    entries: createEntries(scheme.reduce((result, entryId) => {
      result[entryId] = {
        ...rules[entryId],
        id: entryId
      };

      if (initial[entryId]) {
        result[entryId].value = initial[entryId];
      }

      return result;
    }, {}))
  }
};
