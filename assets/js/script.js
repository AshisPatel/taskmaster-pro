var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};
// $("") is like document.querySelector(...)
$(".list-group").on("click", "p", function(){
  var text = $(this)
  .text()
  .trim(); 
  // $(<>) is like document.CreateElement("...")
  var textInput = $("<textarea>")
  .addClass("form-control")
  .val(text); 
  // Replace selected p element with the textarea element
  $(this).replaceWith(textInput);
  // Triggers the click event on the item that is being focused, which is our clicked task 
  textInput.trigger("focus");  
}); 

$(".list-group").on("blur","textarea", function(){
  // Get textarea's current value
  var text = $(this)
  .val()
  .trim();

  // Get the parent ul's id attribute and replace it to match one of the arrays in the task object 
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-","");

  // Get the task's positionin the list of other li elements
  var index = $(this)
  .closest(".list-group-item")
  .index(); 

  // Save our editted task in our task list
  tasks[status][index].text = text;
  saveTasks(); 

  // Convert textarea back into a p
  var taskP = $("<p>")
  .addClass("m-1")
  .text(text); 

  // Replace textarea with p 
  $(this).replaceWith(taskP); 
});

// When a date span is selected, convert it to an edittable input field 
$(".list-group").on("click", "span", function() {
  // Get current date
  var date = $(this)
  .text()
  .trim();
  // Create input with same date 
  var dateInput = $("<input>")
  .attr("type","text")
  .addClass("form-control")
  .val(date); 

  // Replace span with the textarea
  $(this).replaceWith(dateInput); 

  // Automatically focus on selected item
  dateInput.trigger("focus"); 
});

// After date input is unselected, convert back to span 
$(".list-group").on("blur", "input", function(){
  // Get current text
  var date = $(this)
  .val()
  .trim();
  // Get the parent ul's id attribute
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-","");
  // Get the task's position in the list of other li items
  var index = $(this)
  .closest(".list-group-item")
  .index(); 
  // Update task in array and re-save to localStorage
  tasks[status][index].date = date; 
  saveTasks();
  // Recreate span element with bootstrap classes
  var taskSpan = $("<span>")
  .addClass("badge badge-primary badge-pill")
  .text(date); 
  // Replace input with span element
  $(this).replaceWith(taskSpan); 
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// Add ability to drag tasks to other task lists and re-order tasks within their own list
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"), 
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    console.log("activate",this);
  },
  deactivate: function(event) {
    console.log("decativate", this)
  },
  over: function(event) {
    console.log("over", event.target)
  },
  out: function(event) {
    console.log("out", event.target)
  },
  update: function(event) {
    // array to store the new order of task data in
    var tempArr = []; 
    // loop over current set of children in sortable list
    // first this is looking at the overall card or list (ul), second this is refrencing the list item (li) in the (ul)
    $(this).children().each(function() {
      var text = $(this)
      .find("p")
      .text()
      .trim();
      
      var date = $(this)
      .find("span")
      .text()
      .trim(); 

      // add task data to the tempy array as an object
      tempArr.push({
        text: text, 
        date: date
      }); 
    });
     // find the id for the list that is being changed
     var arrName = $(this)
     .attr("id")
     .replace("list-","");

     // update array in the tasks object and save
     tasks[arrName] = tempArr;
     saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


