#![allow(clippy::not_unsafe_ptr_arg_deref)]
use swc_core::{
    ecma::ast::Program,
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};
use swc_ecma_visit::VisitMutWith;

#[plugin_transform]
fn swc_plugin(mut program: Program, data: TransformPluginProgramMetadata) -> Program {
    let config: aether::Config = serde_json::from_str::<Option<aether::Config>>(
        &data
            .get_transform_plugin_config()
            .expect("failed to get plugin config for aether-react"),
    )
    .expect("invalid packages")
    .unwrap_or_else(|| aether::Config::All(true));

    let source_map = std::sync::Arc::new(data.source_map);
    program.visit_mut_with(&mut aether::preprocess(config, source_map));
    program
}
