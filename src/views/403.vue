<template>
  <div class="forbidden">
    <h1>{{ $t('errors.403.title') }}</h1>
    <p>{{ $t('errors.403.message') }}</p>
    <router-link to="/">{{ $t('errors.403.back') }}</router-link>
  </div>
</template>

<script>
export default {
  name: 'Forbidden',
};
</script>

<style>
.forbidden {
  text-align: center;
  margin-top: 100px;
}
.forbidden h1 {
  font-size: 96px;
  color: #ff4d4f;
}
.forbidden p {
  font-size: 18px;
  margin: 16px 0;
}
</style>
