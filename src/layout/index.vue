<template>
  <el-container>
    <el-aside width="200px">
      <Menus />
    </el-aside>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>
<script setup lang="ts">
import Menus from './menus.vue'
</script>
