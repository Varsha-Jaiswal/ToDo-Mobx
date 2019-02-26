import {observable, computed, reaction, action} from 'mobx';
import uuid from "uuid";
import TodoModel from './models/TodoModel';


export default class TodoStore {
	todos = observable([]);

	activeTodoCount = computed(() => {
		return this.todos.reduce(
			(sum, todo) => sum + (todo.completed ? 0 : 1),
			0
		)
	})

	completedCount = computed(() => {
		return this.todos.length - this.activeTodoCount;
	})

	subscribeServerToStore() {
		reaction(
			() => this.toJS(),
			todos => window.fetch && fetch('/api/todos', {
				method: 'post',
				body: JSON.stringify({ todos }),
				headers: new Headers({ 'Content-Type': 'application/json' })
			})
		);
	}

	addTodo = action((title) => {
		this.todos.push(new TodoModel(this, uuid, title, false));
  })
  
	toggleAll = action((checked) => {
		this.todos.forEach(
			todo => todo.completed = checked
		);
	})

	clearCompleted = action(() => {
		this.todos = this.todos.filter(
			todo => !todo.completed
		);
	})

	toJS() {
		return this.todos.map(todo => todo.toJS());
	}

	static fromJS(array) {
		const todoStore = new TodoStore();
		todoStore.todos = array.map(item => TodoModel.fromJS(todoStore, item));
		return todoStore;
	}
}
