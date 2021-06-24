<template>
  <div id="app">
    <div v-if="flag">{{ msg }}</div>
    <div v-else>{{ msg1 }}</div>
    <button @click="change">change</button>
    <button @click="change">toggle</button>
  </div>
</template>
<script>
export default {
  name:"APP",
  data() {
    return {
      flag: true,
      msg: "Hello World",
      msg1: "helll0000000"
    };
  },
  created () {
    this.test();
  },
  methods: {
    change() {
      debugger
      this.$nextTick().then(() => {
        console.log(" this.$nextTick().then(()=>{", 3);
      });
      debugger

      this.$nextTick().then(() => {
        console.log(" this.$nextTick().then(()=>{", 4);
      });
    },
    test(){
      console.log(this.msg);
    }
  }
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
