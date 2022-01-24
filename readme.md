### 调试

```bash
yarn  # 安装依赖

yarn watch  # 实时编译sdk
yarn watch:test # 测试页面
```

### 打包

```bash
yarn build
```

### 目录

```bash
├── dist              # umd打包文件
├── es                # module打包文件
├── src               # 源码
├── package.json
├── readme.md
├── tests             # 测试页面
├── rollup.config.js  # rollup配置
├── tsconfig.json     # ts配置
```

```bash
npm publish --access=public
```
