import createStore from 'lib/create-store/create-store';

const storeMethods = {
  clearById(this: Message[], id: string) {
    return this.filter(message => {
      return message.id !== id;
    });
  },

  addMessage(this: Message[], options: MessageOptions) {
    this.push(createMessage(options));
  },

  addMessages(this: Message[], data: MessageOptions[]) {
    this.push(
      ...data.map(createMessage)
    );
  }
};

const createMessage = (options: MessageOptions): Message => ({
  ...options,
  id: (Date.now() + Math.random()).toString()
});

const store = createStore<Message[], typeof storeMethods>(
  [], storeMethods
);

export default store;
