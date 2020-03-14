import createStore from 'lib/create-store/create-store';

interface MessagesStoreInterface {
  clearById(id: string);
  addMessage(options: MessageOptions);
  addMessages(messages: MessageOptions[]);
}

const createMessage = (options: MessageOptions): Message => ({
  ...options,
  id: (Date.now() + Math.random()).toString()
});

const store = createStore<MessagesStoreInterface, Message[]>([], $messages => ({
    clearById(id: string) {
      return $messages.filter(message => {
        return message.id !== id;
      });
    },

    addMessage(options: MessageOptions) {
      $messages.push(createMessage(options));
    },

    addMessages(data: MessageOptions[]) {
      $messages.push(
        ...data.map(createMessage)
      );
    }
  })
);

export default store;
