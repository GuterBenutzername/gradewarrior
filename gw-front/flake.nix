{
  description = "GradeWarrior frontend";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            deno
            nodejs
          ];
        };

        packages = {
          default = pkgs.stdenv.mkDerivation {
            name = "gradewarrior-frontend";
            src = ./.;

            nativeBuildInputs = with pkgs; [
              deno
              nodejs
            ];

            buildPhase = ''
              export HOME=$(mktemp -d)
              deno task build
            '';

            installPhase = ''
              mkdir -p $out
              cp -r dist/* $out/
            '';
          };
        };
      }
    );
}
