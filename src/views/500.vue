<template>
  <div class="server-error">
    <h1>{{ $t('errors.500.title') }}</h1>
    <p>{{ $t('errors.500.message') }}</p>
    <router-link to="/">{{ $t('errors.500.back') }}</router-link>
  </div>
</template>

<script>
export default {
  name: 'ServerError',
};
</script>

<style>
.server-error {
  text-align: center;
  margin-top: 100px;
}
.server-error h1 {
  font-size: 96px;
  color: #faad14;
}
.server-error p {
  font-size: 18px;
  margin: 16px 0;
}
</style>
