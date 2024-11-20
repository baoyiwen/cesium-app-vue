<template>
  <div class="not-found">
    <h1>{{ $t('errors.404.title') }}</h1>
    <p>{{ $t('errors.404.message') }}</p>
    <router-link to="/">{{ $t('errors.404.back') }}</router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
};
</script>

<style>
.not-found {
  text-align: center;
  margin-top: 100px;
}
.not-found h1 {
  font-size: 96px;
  color: #ff6f61;
}
.not-found p {
  font-size: 18px;
  margin: 16px 0;
}
</style>
