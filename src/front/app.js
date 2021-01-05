app=new Vue({ 
  el: '#app',
  data: {
    projects: [],
    currentProject: null,
    dialog: null,
    toast: null
  },
  methods: {
    capture: function () {
      this.$refs.camera.show=true;
    },
    create_project: function() {
      this.dialog.showModal();
    }
  },
  created: function () {
    //axios
    //.get("http://localhost:8080/api/projects")
    //.then(response => {
    //  console.log(response)
    //  this.projects = response.data;
    //  this.currentProject = this.projects[0].name
    //})
  }
});

dialogAcitions=new Vue({ 
  el: '#dialog_acitions',
  data: {
  },
  methods: {
    cancel: function() {
      console.log('test')
      this.dialog.close();
    }
  },
  created: function () {
    this.dialog = document.querySelector('#dialog');
  }
})
