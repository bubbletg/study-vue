<template>
  <div id="app">
    <ui @click="test">
      <li v-for="item in obj" :key="item.id">{{item.name}}</li>
    </ui>
  </div>
</template>
<script>
export default {
  name: 'APP',
  data() {
    return {
      obj: [
        { id: 1, name: '1111' },
        { id: 2, name: '2222' },
        { id: 3, name: '3333' },
        { id: 4, name: '444' },
        { id: 5, name: '555' },
      ],
    };
  },
  created() {
  },
  methods: {
    test() {
      this.obj = [
        { id: 1, name: '1111' },
        { id: 2, name: '2222' },
        { id: 4, name: '444' },
        { id: 5, name: '555' },
      ];
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
