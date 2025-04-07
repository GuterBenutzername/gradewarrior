{
  description = "GradeWarrior Backend";

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
            python313
            python313Packages.ariadne
            python313Packages.sqlalchemy
            python313Packages.uvicorn
            python313Packages.starlette
            python313Packages.psycopg2
	          python313Packages.ruff
          ];
        };
      }
    );
}
