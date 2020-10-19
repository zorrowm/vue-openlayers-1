<template>
<!-- 测试用例 -->
  <a-select
    show-search
    allowClear
    :value="value"
    placeholder="input search text"
    style="width: 200px"
    :default-active-first-option="false"
    :show-arrow="false"
    @change="handleChange"
    @inputKeydown="Keydown"
    :open="openSelect"
  >
    <a-icon type="search" slot="suffixIcon" />
    <a-select-option v-for="d in data" :key="d.value">
      {{ d.text }}
    </a-select-option>
  </a-select>
</template>
<script>
export default {
  data() {
    return {
      data: [],
      value: undefined,
      openSelect:false,
    };
  },
  methods: {
    handleChange(value) {
      console.log(value);
    },
    Keydown(value){ 
        if(value.key === 'Enter'){
            debugger
            this.openSelect = true
        }
    },
  },
};
</script>