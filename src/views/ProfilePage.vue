<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <MemberTable />
  </div>
  <footer class="footer mt-5">
  <div class="footer-area">
    <div class="container text-center pt-5">
      <p class="col-lg-12 footer-text text-center">
  Copyright © {{ new Date().getFullYear() }} All rights reserved |
  This template is made with <i class="fa fa-heart" aria-hidden="true"></i>
  by <a href="https://colorlib.com" target="_blank" rel="noopener">Colorlib</a>
</p>
    </div>
  </div>
</footer>
</template>

<script setup>
import MemberTable from '@/components/MemberTable.vue';

</script>