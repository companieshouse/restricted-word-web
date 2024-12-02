"use strict";

const gulp = require("gulp");
const dartSass = require("sass");
const gulpSass = require("gulp-sass");

const sass = gulpSass(dartSass);

// Copies the fonts and images from the govuk-frontend package to the dist directory
gulp.task("govuk-frontend-copy", function () {
    return gulp
        .src(["./node_modules/govuk-frontend/govuk/assets/**/*"])
        .pipe(gulp.dest("./dist"));
});

// Compiles the sass down to css
gulp.task("sass", function () {
    return gulp
        .src("./scss/**/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("./dist/stylesheets"));
});

// Executes all static asset tasks in parallel
exports.build = gulp.parallel(
    gulp.task("sass"),
    gulp.task("govuk-frontend-copy")
);
