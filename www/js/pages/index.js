/**
 * @jsx React.DOM
 */

require(["../main"], function() {
    "use strict";

    require(["React", "jquery", "SocketIO", "pages/ErrorBox"], function(React, $, io, ErrorBox) {

        var $descriptionBox = $("#todo-description");

        var socket          = io("http://localhost:1337/");

        ErrorBox(socket);
        
        /** Create a tble to store the todo list */
        var TodoTable = React.createClass({displayName: 'TodoTable',

            TODO_LIST_PROP: "todoList",

            /**
             * Create an object to set into the "todo" state
             * @param {Array} data - An array of todo objects
             */
            createTodoObject: function(data) {
                var todoList = {};
                todoList[this.TODO_LIST_PROP] = data;
                return todoList;
            },

            /**
             * Get the current state of 'todoList'
             * @return {Object}
             */
            getTodoState: function() {
                return this.state.todoList;
            },

            /**
             * Update the state of 'todoList'
             * @param {Array} data - An array of todo objects
             */
            setTodoState: function(data) {
                this.setState(this.createTodoObject(data));
            },

            /**
             * Add a new todo
             * @param {String} newTodoDescription
             */
            addNewTodo: function(newTodoDescription) {
                var todoList = this.getTodoState().concat({ "description" : newTodoDescription });
                this.setTodoState(todoList);
            },

            /**
             * Set the initial state of teh todo list
             */
            getInitialState: function() {
                return this.createTodoObject([]);
            },

            /**
             * This method should be called when the table is first rendered
             */
            componentDidMount: function() {

                $(function() {
                    $("form").on("submit", function(e) {
                        socket.emit("add", $descriptionBox.val());
                        $descriptionBox.val("");
                        return false;
                    });
                });

                var reactThis = this;

                socket.on("new-todo-list", function(objs) {
                    reactThis.setTodoState(objs);
                });

            },

            /**
             * Render the table, each time the state is changed
             */
            render: function() {
                return (
                    React.DOM.table({className: "table table-striped todo-table"}, 
                        React.DOM.thead(null, 
                            React.DOM.tr(null, React.DOM.th(null, "Description"))
                        ), 
                        TodoList({todoList: this.state.todoList})
                    )
                );
            }
        });

        /** Create the todo list tbody data */
        var TodoList = React.createClass({displayName: 'TodoList',
            render: function() {
                if (this.props.todoList.length > 0) {
                    var todoNodes = this.props.todoList.map(function(todo) {
                        return (TodoRow({description: todo.description}));
                    });
                } else {
                    var todoNodes = TodoRow({description: "There is nothing to do, grab yourself a beer!"})
                }
                return ( 
                    React.DOM.tbody(null, todoNodes)
                );
            }
        });

        /** Create a new row for the todo list */
        var TodoRow = React.createClass({displayName: 'TodoRow',
            render: function() {
                return (   
                    React.DOM.tr(null, React.DOM.td(null, this.props.description))
                );
            }
        });

        React.renderComponent(TodoTable(null), document.getElementById('todo-div'));

    });
});
